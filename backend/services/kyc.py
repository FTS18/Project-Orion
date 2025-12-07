"""
KYC Verification Service - SOLID Single Responsibility
"""
from datetime import datetime
from backend.models.schemas import KycVerificationResponse, KYCStatus, AuditLogEntry
from backend.storage.data import StorageManager


class KycVerificationService:
    """Verifies KYC details with fuzzy matching"""

    @staticmethod
    async def verify(
        customer_id: str, provided_name: str, provided_phone: str, provided_address: str
    ) -> KycVerificationResponse:
        """Verify KYC details"""

        # Demo mode: Auto-verify custom customers
        if customer_id.startswith("CUSTOM"):
            return KycVerificationResponse(
                status=KYCStatus.VERIFIED,
                mismatches=[],
            )

        crm_record = StorageManager.get_crm_record(customer_id)
        if not crm_record:
            return KycVerificationResponse(
                status=KYCStatus.FAILED,
                mismatches=["Customer not found in CRM"],
            )

        mismatches = []

        # Name verification (fuzzy match)
        if not KycVerificationService._fuzzy_match(provided_name, crm_record.name):
            mismatches.append(
                f'Name mismatch: provided "{provided_name}", expected "{crm_record.name}"'
            )

        # Phone verification (exact match)
        normalized_provided = provided_phone.replace(" ", "").replace("-", "")
        normalized_crm = crm_record.phone.replace(" ", "").replace("-", "")
        if normalized_provided != normalized_crm:
            mismatches.append(f'Phone mismatch: provided "{provided_phone}"')

        # Address verification (city/pincode check)
        address_lower = provided_address.lower()
        city_match = crm_record.city.lower() in address_lower
        pincode_match = crm_record.pincode in address_lower

        if not city_match and not pincode_match:
            mismatches.append(
                f"Address must include city ({crm_record.city}) or pincode ({crm_record.pincode})"
            )

        # Log verification
        entry = AuditLogEntry(
            id="",
            customerId=customer_id,
            timestamp=datetime.utcnow().isoformat(),
            action="KYC_VERIFICATION",
            reason="All details verified" if not mismatches else f"Mismatches found: {len(mismatches)}",
            metadata={
                "mismatches": mismatches,
                "providedName": provided_name,
                "providedPhone": provided_phone,
                "providedAddress": provided_address,
            },
        )
        StorageManager.add_audit_log(entry)

        return KycVerificationResponse(
            status=KYCStatus.VERIFIED if not mismatches else KYCStatus.PENDING,
            mismatches=mismatches,
        )

    @staticmethod
    def _fuzzy_match(str1: str, str2: str) -> bool:
        """Fuzzy string matching with 80% threshold"""

        def normalize(s: str) -> str:
            return s.lower().strip().replace("  ", " ")

        n1 = normalize(str1)
        n2 = normalize(str2)

        # Exact match
        if n1 == n2:
            return True

        # Contains match
        if n1 in n2 or n2 in n1:
            return True

        # Similarity threshold
        similarity = KycVerificationService._calculate_similarity(n1, n2)
        return similarity > 0.8

    @staticmethod
    def _calculate_similarity(str1: str, str2: str) -> float:
        """Calculate string similarity ratio"""
        longer = str1 if len(str1) > len(str2) else str2
        shorter = str2 if len(str1) > len(str2) else str1

        if len(longer) == 0:
            return 1.0

        matches = sum(1 for c in shorter if c in longer)
        return matches / len(longer)
