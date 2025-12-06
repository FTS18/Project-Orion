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
        self.file_path = "data/rules.json"
        self._load_rules()

    def _load_rules(self):
        """Load rules from JSON file or default if missing"""
        import json
        import os
        
        if os.path.exists(self.file_path):
            try:
                with open(self.file_path, 'r') as f:
                    data = json.load(f)
                    self.rules = []
                    for r_data in data:
                        # Convert string values back to Enums
                        r_data['rule_type'] = RuleType(r_data['rule_type'])
                        r_data['operator'] = RuleOperator(r_data['operator'])
                        self.rules.append(BusinessRule(**r_data))
                return
            except Exception as e:
                print(f"Error loading rules: {e}")
        
        # Fallback to defaults if file doesn't exist or error
        self._load_default_rules()
        self._save_rules()

    def _save_rules(self):
        """Save rules to JSON file"""
        import json
        
        data = []
        for r in self.rules:
            r_dict = r.__dict__.copy()
            # Convert Enums to strings for JSON serialization
            r_dict['rule_type'] = r.rule_type.value
            r_dict['operator'] = r.operator.value
            data.append(r_dict)
            
        try:
            with open(self.file_path, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"Error saving rules: {e}")

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
        ), save=False)

        self.add_rule(BusinessRule(
            name="EMI Income Ratio",
            rule_type=RuleType.EMI_INCOME_RATIO,
            operator=RuleOperator.LESS_EQUAL,
            threshold=50,
            action="APPROVE",
            priority=90,
            description="EMI should not exceed 50% of monthly income"
        ), save=False)

        self.add_rule(BusinessRule(
            name="Existing Loan Check",
            rule_type=RuleType.EXISTING_LOAN_CHECK,
            operator=RuleOperator.EQUAL,
            threshold="no",
            action="APPROVE",
            priority=80,
            description="Prefer customers with no existing loans"
        ), save=False)

    def add_rule(self, rule: BusinessRule, save: bool = True):
        """Add a new rule to the engine"""
        self.rules.append(rule)
        self.rules.sort(key=lambda r: r.priority, reverse=True)
        if save:
            self._save_rules()

    def remove_rule(self, name: str):
        """Remove a rule by name"""
        self.rules = [r for r in self.rules if r.name != name]
        self._save_rules()

    def update_rule(self, name: str, **kwargs):
        """Update an existing rule"""
        for rule in self.rules:
            if rule.name == name:
                for key, value in kwargs.items():
                    if hasattr(rule, key):
                        # Handle Enum conversions if strings are passed
                        if key == 'rule_type' and isinstance(value, str):
                            value = RuleType(value)
                        elif key == 'operator' and isinstance(value, str):
                            value = RuleOperator(value)
                        setattr(rule, key, value)
                break
        self._save_rules()

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
