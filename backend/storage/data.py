"""
In-memory data storage - mirrors Express backend
"""
from backend.models.schemas import (
    Customer, CrmRecord, LoanOffer, AuditLogEntry
)
from typing import Dict, List, Optional
from datetime import datetime
from uuid import uuid4


# Synthetic customer data
CUSTOMERS: Dict[str, Customer] = {
    "CUST001": Customer(
        customerId="CUST001",
        name="Anita Verma",
        age=29,
        city="Delhi",
        phone="+91-9810000001",
        email="anita.verma@example.com",
        existingLoan="no",
        existingLoanAmount=0,
        creditScore=720,
        preApprovedLimit=150000,
        employmentType="Salaried",
        monthlyNetSalary=65000,
    ),
    "CUST002": Customer(
        customerId="CUST002",
        name="Rahul Mehra",
        age=35,
        city="Mumbai",
        phone="+91-9810000002",
        email="rahul.mehra@example.com",
        existingLoan="yes",
        existingLoanAmount=250000,
        creditScore=680,
        preApprovedLimit=100000,
        employmentType="Salaried",
        monthlyNetSalary=85000,
    ),
    "CUST003": Customer(
        customerId="CUST003",
        name="Sneha Kapoor",
        age=42,
        city="Bengaluru",
        phone="+91-9810000003",
        email="sneha.kapoor@example.com",
        existingLoan="no",
        existingLoanAmount=0,
        creditScore=790,
        preApprovedLimit=200000,
        employmentType="Self-Employed",
        monthlyNetSalary=120000,
    ),
    "CUST004": Customer(
        customerId="CUST004",
        name="Prakash Singh",
        age=31,
        city="Chandigarh",
        phone="+91-9810000004",
        email="prakash.singh@example.com",
        existingLoan="no",
        existingLoanAmount=0,
        creditScore=695,
        preApprovedLimit=90000,
        employmentType="Salaried",
        monthlyNetSalary=40000,
    ),
    "CUST005": Customer(
        customerId="CUST005",
        name="Meera Nair",
        age=27,
        city="Hyderabad",
        phone="+91-9810000005",
        email="meera.nair@example.com",
        existingLoan="yes",
        existingLoanAmount=120000,
        creditScore=710,
        preApprovedLimit=110000,
        employmentType="Salaried",
        monthlyNetSalary=50000,
    ),
    "CUST006": Customer(
        customerId="CUST006",
        name="Aditya Rao",
        age=38,
        city="Pune",
        phone="+91-9810000006",
        email="aditya.rao@example.com",
        existingLoan="no",
        existingLoanAmount=0,
        creditScore=650,
        preApprovedLimit=80000,
        employmentType="Self-Employed",
        monthlyNetSalary=95000,
    ),
    "CUST007": Customer(
        customerId="CUST007",
        name="Sunita Ghosh",
        age=45,
        city="Kolkata",
        phone="+91-9810000007",
        email="sunita.ghosh@example.com",
        existingLoan="yes",
        existingLoanAmount=500000,
        creditScore=730,
        preApprovedLimit=250000,
        employmentType="Salaried",
        monthlyNetSalary=180000,
    ),
    "CUST008": Customer(
        customerId="CUST008",
        name="Dev Patel",
        age=30,
        city="Ahmedabad",
        phone="+91-9810000008",
        email="dev.patel@example.com",
        existingLoan="no",
        existingLoanAmount=0,
        creditScore=770,
        preApprovedLimit=160000,
        employmentType="Salaried",
        monthlyNetSalary=70000,
    ),
    "CUST009": Customer(
        customerId="CUST009",
        name="Ritika Sharma",
        age=33,
        city="Jaipur",
        phone="+91-9810000009",
        email="ritika.sharma@example.com",
        existingLoan="no",
        existingLoanAmount=0,
        creditScore=640,
        preApprovedLimit=60000,
        employmentType="Self-Employed",
        monthlyNetSalary=55000,
    ),
    "CUST010": Customer(
        customerId="CUST010",
        name="Karan Verma",
        age=28,
        city="Noida",
        phone="+91-9810000010",
        email="karan.verma@example.com",
        existingLoan="no",
        existingLoanAmount=0,
        creditScore=705,
        preApprovedLimit=95000,
        employmentType="Salaried",
        monthlyNetSalary=48000,
    ),
}

# CRM records
CRM_DATA: Dict[str, CrmRecord] = {
    "CUST001": CrmRecord(
        customerId="CUST001",
        name="Anita Verma",
        phone="+91-9810000001",
        address="123 Green Park, South Delhi",
        pincode="110016",
        city="Delhi",
        dob="1995-03-15",
    ),
    "CUST002": CrmRecord(
        customerId="CUST002",
        name="Rahul Mehra",
        phone="+91-9810000002",
        address="456 Bandra West, Mumbai",
        pincode="400050",
        city="Mumbai",
        dob="1989-07-22",
    ),
    "CUST003": CrmRecord(
        customerId="CUST003",
        name="Sneha Kapoor",
        phone="+91-9810000003",
        address="789 Indiranagar, Bangalore",
        pincode="560038",
        city="Bengaluru",
        dob="1982-11-08",
    ),
    "CUST004": CrmRecord(
        customerId="CUST004",
        name="Prakash Singh",
        phone="+91-9810000004",
        address="101 Sector 17, Chandigarh",
        pincode="160017",
        city="Chandigarh",
        dob="1993-05-30",
    ),
    "CUST005": CrmRecord(
        customerId="CUST005",
        name="Meera Nair",
        phone="+91-9810000005",
        address="202 Banjara Hills, Hyderabad",
        pincode="500034",
        city="Hyderabad",
        dob="1997-09-12",
    ),
    "CUST006": CrmRecord(
        customerId="CUST006",
        name="Aditya Rao",
        phone="+91-9810000006",
        address="303 Koregaon Park, Pune",
        pincode="411001",
        city="Pune",
        dob="1986-01-25",
    ),
    "CUST007": CrmRecord(
        customerId="CUST007",
        name="Sunita Ghosh",
        phone="+91-9810000007",
        address="404 Salt Lake, Kolkata",
        pincode="700091",
        city="Kolkata",
        dob="1979-04-18",
    ),
    "CUST008": CrmRecord(
        customerId="CUST008",
        name="Dev Patel",
        phone="+91-9810000008",
        address="505 SG Highway, Ahmedabad",
        pincode="380054",
        city="Ahmedabad",
        dob="1994-12-03",
    ),
    "CUST009": CrmRecord(
        customerId="CUST009",
        name="Ritika Sharma",
        phone="+91-9810000009",
        address="606 C-Scheme, Jaipur",
        pincode="302001",
        city="Jaipur",
        dob="1991-08-20",
    ),
    "CUST010": CrmRecord(
        customerId="CUST010",
        name="Karan Verma",
        phone="+91-9810000010",
        address="707 Sector 62, Noida",
        pincode="201301",
        city="Noida",
        dob="1996-06-14",
    ),
}

# Pre-approved offers
OFFERS: List[LoanOffer] = [
    LoanOffer(
        offerId="OFF001",
        customerId="CUST001",
        creditBand="good",
        maxAmount=300000,
        interestRate=10.5,
        tenure=36,
        processingFee=1000,
    ),
    LoanOffer(
        offerId="OFF002",
        customerId="CUST002",
        creditBand="fair",
        maxAmount=200000,
        interestRate=12.5,
        tenure=24,
        processingFee=1500,
    ),
    LoanOffer(
        offerId="OFF003",
        customerId="CUST003",
        creditBand="excellent",
        maxAmount=500000,
        interestRate=9.5,
        tenure=48,
        processingFee=500,
    ),
    LoanOffer(
        offerId="OFF004",
        customerId="CUST004",
        creditBand="fair",
        maxAmount=180000,
        interestRate=13.0,
        tenure=24,
        processingFee=1500,
    ),
    LoanOffer(
        offerId="OFF005",
        customerId="CUST005",
        creditBand="good",
        maxAmount=220000,
        interestRate=11.0,
        tenure=36,
        processingFee=1000,
    ),
    LoanOffer(
        offerId="OFF006",
        customerId="CUST006",
        creditBand="poor",
        maxAmount=160000,
        interestRate=14.0,
        tenure=24,
        processingFee=2000,
    ),
    LoanOffer(
        offerId="OFF007",
        customerId="CUST007",
        creditBand="good",
        maxAmount=500000,
        interestRate=10.0,
        tenure=48,
        processingFee=1000,
    ),
    LoanOffer(
        offerId="OFF008",
        customerId="CUST008",
        creditBand="excellent",
        maxAmount=320000,
        interestRate=9.75,
        tenure=36,
        processingFee=500,
    ),
    LoanOffer(
        offerId="OFF009",
        customerId="CUST009",
        creditBand="poor",
        maxAmount=120000,
        interestRate=14.5,
        tenure=24,
        processingFee=2000,
    ),
    LoanOffer(
        offerId="OFF010",
        customerId="CUST010",
        creditBand="good",
        maxAmount=190000,
        interestRate=11.5,
        tenure=36,
        processingFee=1000,
    ),
]

# Audit logs
AUDIT_LOGS: List[AuditLogEntry] = []

# Sanction letters
SANCTION_LETTERS: Dict[str, Dict] = {}


class StorageManager:
    """Manages all data operations"""

    @staticmethod
    def get_customer(customer_id: str) -> Optional[Customer]:
        return CUSTOMERS.get(customer_id)

    @staticmethod
    def get_all_customers() -> List[Customer]:
        return list(CUSTOMERS.values())

    @staticmethod
    def get_crm_record(customer_id: str) -> Optional[CrmRecord]:
        return CRM_DATA.get(customer_id)

    @staticmethod
    def get_credit_data(customer_id: str) -> Optional[Dict]:
        customer = CUSTOMERS.get(customer_id)
        if customer:
            return {
                "customerId": customer_id,
                "score": customer.creditScore,
                "preApprovedLimit": customer.preApprovedLimit,
            }
        return None

    @staticmethod
    def get_offers() -> List[LoanOffer]:
        return OFFERS

    @staticmethod
    def get_offers_by_customer(customer_id: str) -> List[LoanOffer]:
        return [offer for offer in OFFERS if offer.customerId == customer_id]

    @staticmethod
    def add_audit_log(entry: AuditLogEntry) -> AuditLogEntry:
        entry.id = str(uuid4())
        AUDIT_LOGS.append(entry)
        return entry

    @staticmethod
    def get_audit_logs(customer_id: str) -> List[AuditLogEntry]:
        return [log for log in AUDIT_LOGS if log.customerId == customer_id]

    @staticmethod
    def save_sanction_letter(customer_id: str, reference_number: str) -> None:
        SANCTION_LETTERS[reference_number] = {
            "customerId": customer_id,
            "generatedAt": datetime.utcnow().isoformat(),
        }

    @staticmethod
    def get_sanction_letter(reference_number: str) -> Optional[Dict]:
        return SANCTION_LETTERS.get(reference_number)
