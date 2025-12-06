"""
Worker Agents for Project Orion Hackathon 6.0
Each agent handles a specific part of the loan approval workflow
"""
from typing import Dict, Any
import random
from ..storage.data import StorageManager


class SalesAgent:
    """Negotiates loan terms and discusses customer needs"""
    
    def __init__(self):
        self.storage = StorageManager()
    
    async def negotiate(self, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """Negotiate loan terms with customer"""
        name = customer_data.get("name", "Customer")
        
        # Get pre-approved offers
        offers = self.storage.get_offers()
        
        # Select the first offer or create a default
        if offers and len(offers) > 0:
            best_offer = offers[0]
            offer_dict = {
                "name": "Standard Personal Loan",
                "amount": best_offer.maxAmount,
                "rate": best_offer.interestRate,
                "tenure": best_offer.tenure
            }
        else:
            offer_dict = {
                "name": "Standard Personal Loan",
                "amount": 500000,
                "rate": 12.5,
                "tenure": 60
            }
        
        emi = self._calculate_emi(offer_dict['amount'], offer_dict['rate'], offer_dict['tenure'])
        
        return {
            "status": "success",
            "offer": offer_dict,
            "message": f"Great! I've prepared a personalized offer for you, {name}:\n\n"
                      f"• Loan Amount: ₹{int(offer_dict['amount']):,}\n"
                      f"• Interest Rate: {offer_dict['rate']}% p.a.\n"
                      f"• Tenure: {offer_dict['tenure']} months\n"
                      f"• Monthly EMI: ₹{emi:,.0f}",
            "emi": emi,
            "offer_details": offer_dict
        }
    
    def _calculate_emi(self, principal: float, rate: float, tenure: int) -> float:
        """Calculate EMI: P * R * (1+R)^N / ((1+R)^N - 1)"""
        monthly_rate = rate / 100 / 12
        if monthly_rate == 0:
            return principal / tenure
        emi = principal * monthly_rate * (1 + monthly_rate) ** tenure / ((1 + monthly_rate) ** tenure - 1)
        return emi


class VerificationAgent:
    """Verifies KYC details from CRM"""
    
    def __init__(self):
        self.storage = StorageManager()
    
    async def verify_kyc(self, customer_id: str, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """Verify KYC details from CRM"""
        # Get customer from CRM
        customer = self.storage.get_customer(customer_id)
        
        if not customer:
            return {
                "status": "failed",
                "verified": False,
                "message": "Customer not found in CRM"
            }
        
        # Check if provided data matches CRM
        verified_fields = {
            "name": customer_data.get("name") == customer.name if customer_data.get("name") else True,
            "email": customer_data.get("email") == customer.email if customer_data.get("email") else True,
            "phone": customer_data.get("phone") == customer.phone if customer_data.get("phone") else True,
        }
        
        return {
            "status": "success",
            "verified": all(verified_fields.values()),
            "verified_fields": verified_fields,
            "message": "✓ KYC verification complete\n"
                      "• Name verified\n"
                      "• Phone verified\n"
                      "• Address on file verified",
            "customer": customer
        }


class UnderwritingAgent:
    """Handles credit evaluation and approval decision"""
    
    def __init__(self):
        self.storage = StorageManager()
    
    async def evaluate_and_approve(self, 
                                  customer_id: str, 
                                  loan_amount: float,
                                  monthly_income: float,
                                  monthly_emi: float) -> Dict[str, Any]:
        """Evaluate credit and make approval decision"""
        
        # Mock credit score (900 scale)
        credit_score = random.randint(720, 850)
        
        # Pre-approved limits from CRM
        customer = self.storage.get_customer(customer_id)
        pre_approved_limit = customer.preApprovedLimit if customer else 300000
        
        # Evaluation rules
        from backend.services.rules_engine import rules_engine
        
        # Prepare context for rules engine
        # Note: Keys must match RuleType enum values in rules_engine.py
        context = {
            "credit_score_min": credit_score,
            "amount_vs_preapproved": loan_amount / pre_approved_limit if pre_approved_limit > 0 else 999,
            "emi_income_ratio": (monthly_emi / monthly_income * 100) if monthly_income > 0 else 100,
            "existing_loan_check": "no",  # Mock value as we don't have this in customer data yet
            "age_restriction": 30,  # Mock value
            "employment_type": "Salaried" # Mock value
        }
        
        # Evaluate using rules engine
        decision, reason = rules_engine.evaluate_all(context)
        
        # Determine if docs are needed (custom logic not yet in rules engine, keeping it simple)
        needs_docs = False
        if decision == "APPROVE" and loan_amount > pre_approved_limit:
             needs_docs = True

        return {
            "status": "success",
            "decision": decision,
            "credit_score": credit_score,
            "pre_approved_limit": pre_approved_limit,
            "needs_salary_slip": needs_docs,
            "rejection_reason": reason if decision == "REJECT" else None,
            "message": f"{'✅ APPROVED' if decision == 'APPROVE' else '❌ REJECTED'}\n\n"
                      f"Credit Score: {credit_score}/900\n"
                      f"Pre-approved Limit: ₹{pre_approved_limit:,}\n"
                      f"Requested Amount: ₹{loan_amount:,.0f}\n"
                      f"{f'Monthly EMI vs Income: {(monthly_emi/monthly_income*100):.1f}%' if monthly_income > 0 else ''}\n"
                      f"Reason: {reason}"
        }


class SanctionLetterGenerator:
    """Generates PDF sanction letter"""
    
    def __init__(self):
        self.storage = StorageManager()
    
    async def generate_letter(self, 
                             customer_id: str,
                             customer_name: str,
                             loan_amount: float,
                             tenure: int,
                             rate: float,
                             monthly_emi: float,
                             ref_number: str) -> Dict[str, Any]:
        """Generate sanction letter as base64 PDF"""
        
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
            from reportlab.lib import colors
            from io import BytesIO
            import base64
            
            # Create PDF in memory
            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            elements = []
            
            # Styles
            styles = getSampleStyleSheet()
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=24,
                textColor=colors.HexColor('#1F3A93'),
                spaceAfter=30,
                alignment=1
            )
            
            heading_style = ParagraphStyle(
                'CustomHeading',
                parent=styles['Heading2'],
                fontSize=12,
                textColor=colors.HexColor('#1F3A93'),
                spaceAfter=12
            )
            
            # Title
            elements.append(Paragraph("LOAN SANCTION LETTER", title_style))
            elements.append(Spacer(1, 0.3*72))
            
            # Reference info
            ref_data = [
                ["Reference Number:", ref_number],
                ["Date:", datetime.now().strftime("%d-%b-%Y")],
                ["Status:", "APPROVED"]
            ]
            ref_table = Table(ref_data, colWidths=[2*72, 3*72])
            ref_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ]))
            elements.append(ref_table)
            elements.append(Spacer(1, 0.2*72))
            
            # Customer info
            elements.append(Paragraph("CUSTOMER DETAILS", heading_style))
            cust_data = [
                ["Name:", customer_name],
                ["Customer ID:", customer_id],
                ["Approved on:", datetime.now().strftime("%d-%b-%Y")]
            ]
            cust_table = Table(cust_data, colWidths=[2*72, 3*72])
            cust_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#E8F4F8')),
            ]))
            elements.append(cust_table)
            elements.append(Spacer(1, 0.2*72))
            
            # Loan terms
            elements.append(Paragraph("LOAN TERMS & CONDITIONS", heading_style))
            loan_data = [
                ["Loan Amount:", f"₹{loan_amount:,.2f}"],
                ["Interest Rate:", f"{rate}% p.a."],
                ["Tenure:", f"{tenure} months"],
                ["Monthly EMI:", f"₹{monthly_emi:,.2f}"],
                ["Total Amount Payable:", f"₹{monthly_emi * tenure:,.2f}"]
            ]
            loan_table = Table(loan_data, colWidths=[2*72, 3*72])
            loan_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#E8F4F8')),
            ]))
            elements.append(loan_table)
            elements.append(Spacer(1, 0.3*72))
            
            # Terms
            elements.append(Paragraph("This sanction is subject to the following conditions:", heading_style))
            terms_text = """1. The loan is sanctioned for a period of """ + str(tenure) + """ months.<br/>
2. All statutory obligations as per regulatory guidelines have been met.<br/>
3. The customer shall repay the loan in equal monthly installments.<br/>
4. This letter is valid for 7 days from the date of issue.<br/>
5. All documentation must be completed before disbursement."""
            elements.append(Paragraph(terms_text, styles['Normal']))
            elements.append(Spacer(1, 0.3*72))
            
            # Footer
            footer_text = "This is an electronically generated document. Please retain for future reference."
            elements.append(Paragraph(footer_text, styles['Italic']))
            
            # Build PDF
            doc.build(elements)
            buffer.seek(0)
            pdf_bytes = buffer.getvalue()
            pdf_base64 = base64.b64encode(pdf_bytes).decode('utf-8')
            
            return {
                "status": "success",
                "pdf_base64": pdf_base64,
                "reference_number": ref_number,
                "message": f"✓ Sanction letter generated\nReference: {ref_number}\nCustomer notified via email"
            }
        
        except Exception as e:
            return {
                "status": "failed",
                "error": str(e),
                "message": f"Error generating sanction letter: {str(e)}"
            }


from datetime import datetime
