"""
Custom Business Rules Engine - Allow dynamic rule configuration
"""
from typing import Dict, List, Any, Callable
from dataclasses import dataclass
from enum import Enum


class RuleType(str, Enum):
    CREDIT_SCORE_MIN = "credit_score_min"
    AMOUNT_VS_PREAPPROVED = "amount_vs_preapproved"
    EMI_INCOME_RATIO = "emi_income_ratio"
    AGE_RESTRICTION = "age_restriction"
    EMPLOYMENT_TYPE = "employment_type"
    EXISTING_LOAN_CHECK = "existing_loan_check"


class RuleOperator(str, Enum):
    GREATER_THAN = "gt"
    LESS_THAN = "lt"
    EQUAL = "eq"
    GREATER_EQUAL = "gte"
    LESS_EQUAL = "lte"
    IN = "in"


@dataclass
class BusinessRule:
    name: str
    rule_type: RuleType
    operator: RuleOperator
    threshold: Any
    action: str  # "APPROVE" or "REJECT"
    priority: int = 100
    description: str = ""
    enabled: bool = True

    def evaluate(self, value: Any) -> bool:
        """Evaluate rule against a value"""
        if not self.enabled:
            return True

        if self.operator == RuleOperator.GREATER_THAN:
            return value > self.threshold
        elif self.operator == RuleOperator.LESS_THAN:
            return value < self.threshold
        elif self.operator == RuleOperator.EQUAL:
            return value == self.threshold
        elif self.operator == RuleOperator.GREATER_EQUAL:
            return value >= self.threshold
        elif self.operator == RuleOperator.LESS_EQUAL:
            return value <= self.threshold
        elif self.operator == RuleOperator.IN:
            return value in self.threshold
        return True


class RulesEngine:
    """Dynamic business rules engine for loan approvals"""

    def __init__(self):
        self.rules: List[BusinessRule] = []
        self._load_default_rules()

    def _load_default_rules(self):
        """Load default approval rules"""
        self.add_rule(BusinessRule(
            name="Min Credit Score",
            rule_type=RuleType.CREDIT_SCORE_MIN,
            operator=RuleOperator.GREATER_EQUAL,
            threshold=700,
            action="APPROVE",
            priority=100,
            description="Credit score must be at least 700"
        ))

        self.add_rule(BusinessRule(
            name="EMI Income Ratio",
            rule_type=RuleType.EMI_INCOME_RATIO,
            operator=RuleOperator.LESS_EQUAL,
            threshold=50,
            action="APPROVE",
            priority=90,
            description="EMI should not exceed 50% of monthly income"
        ))

        self.add_rule(BusinessRule(
            name="Existing Loan Check",
            rule_type=RuleType.EXISTING_LOAN_CHECK,
            operator=RuleOperator.EQUAL,
            threshold="no",
            action="APPROVE",
            priority=80,
            description="Prefer customers with no existing loans"
        ))

    def add_rule(self, rule: BusinessRule):
        """Add a new rule to the engine"""
        self.rules.append(rule)
        self.rules.sort(key=lambda r: r.priority, reverse=True)

    def remove_rule(self, name: str):
        """Remove a rule by name"""
        self.rules = [r for r in self.rules if r.name != name]

    def update_rule(self, name: str, **kwargs):
        """Update an existing rule"""
        for rule in self.rules:
            if rule.name == name:
                for key, value in kwargs.items():
                    if hasattr(rule, key):
                        setattr(rule, key, value)
                break

    def evaluate_all(self, context: Dict[str, Any]) -> tuple[str, str]:
        """Evaluate all rules and return decision"""
        approvals = []
        rejections = []

        for rule in self.rules:
            if not rule.enabled:
                continue

            # Extract value from context based on rule type
            value = context.get(rule.rule_type.value)

            if value is not None and rule.evaluate(value):
                if rule.action == "APPROVE":
                    approvals.append(rule.name)
                elif rule.action == "REJECT":
                    rejections.append(rule.name)

        # Decision logic: if any rejection rule fires, reject; else approve if approvals exist
        if rejections:
            return "REJECT", f"Failed rules: {', '.join(rejections)}"

        if approvals:
            return "APPROVE", f"Passed rules: {', '.join(approvals)}"

        return "PENDING", "Insufficient data to evaluate"

    def get_rules(self) -> List[Dict[str, Any]]:
        """Get all rules as dictionaries"""
        return [
            {
                "name": r.name,
                "rule_type": r.rule_type.value,
                "operator": r.operator.value,
                "threshold": r.threshold,
                "action": r.action,
                "priority": r.priority,
                "enabled": r.enabled,
                "description": r.description
            }
            for r in self.rules
        ]


# Global rules engine instance
rules_engine = RulesEngine()
