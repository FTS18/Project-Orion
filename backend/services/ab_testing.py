"""
A/B Testing Framework - Compare different agent strategies and configurations
"""
from typing import Dict, List, Any, Optional, Callable
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime
import json
import random


class TestStatus(str, Enum):
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class VariantAllocation(str, Enum):
    EVEN = "even"  # 50/50 split
    SKEWED = "skewed"  # 80/20 split (favor control)
    CUSTOM = "custom"  # Custom split


@dataclass
class Variant:
    name: str
    description: str
    config: Dict[str, Any]
    traffic_weight: float = 0.5  # Portion of traffic to route to this variant


@dataclass
class TestMetrics:
    total_requests: int = 0
    approvals: int = 0
    rejections: int = 0
    avg_response_time: float = 0.0
    avg_satisfaction_score: float = 0.0
    conversion_rate: float = 0.0
    bounce_rate: float = 0.0
    
    def update(self, approved: bool, response_time: float, satisfaction: float = 0.0):
        """Update metrics with new data point"""
        self.total_requests += 1
        if approved:
            self.approvals += 1
        else:
            self.rejections += 1
        
        # Update averages
        self.avg_response_time = (
            (self.avg_response_time * (self.total_requests - 1) + response_time)
            / self.total_requests
        )
        
        if satisfaction > 0:
            self.avg_satisfaction_score = (
                (self.avg_satisfaction_score * (self.total_requests - 1) + satisfaction)
                / self.total_requests
            )
        
        self.conversion_rate = self.approvals / self.total_requests if self.total_requests > 0 else 0.0


@dataclass
class ABTest:
    test_id: str
    name: str
    description: str
    hypothesis: str
    variants: List[Variant]
    status: TestStatus = TestStatus.RUNNING
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    ended_at: Optional[str] = None
    metrics: Dict[str, TestMetrics] = field(default_factory=dict)
    min_sample_size: int = 100
    confidence_level: float = 0.95
    
    def __post_init__(self):
        """Initialize metrics for each variant"""
        for variant in self.variants:
            self.metrics[variant.name] = TestMetrics()


class ABTestingFramework:
    """Framework for A/B testing different agent strategies"""

    def __init__(self):
        self.tests: Dict[str, ABTest] = {}
        self.active_test: Optional[str] = None
        self.history: List[Dict[str, Any]] = []

    def create_test(
        self,
        test_id: str,
        name: str,
        description: str,
        hypothesis: str,
        variants: List[Variant],
        min_sample_size: int = 100,
        confidence_level: float = 0.95,
    ) -> ABTest:
        """Create a new A/B test"""
        test = ABTest(
            test_id=test_id,
            name=name,
            description=description,
            hypothesis=hypothesis,
            variants=variants,
            min_sample_size=min_sample_size,
            confidence_level=confidence_level,
        )
        self.tests[test_id] = test
        self.active_test = test_id
        return test

    def assign_variant(self, test_id: str) -> str:
        """Assign a user/request to a variant based on traffic weights"""
        if test_id not in self.tests:
            raise ValueError(f"Test {test_id} not found")

        test = self.tests[test_id]
        if test.status != TestStatus.RUNNING:
            return test.variants[0].name  # Return default

        # Use weighted random selection
        random_value = random.random()
        cumulative = 0.0

        for variant in test.variants:
            cumulative += variant.traffic_weight
            if random_value <= cumulative:
                return variant.name

        return test.variants[-1].name

    def record_result(
        self,
        test_id: str,
        variant_name: str,
        approved: bool,
        response_time: float,
        satisfaction_score: float = 0.0,
    ):
        """Record test result for a variant"""
        if test_id not in self.tests:
            raise ValueError(f"Test {test_id} not found")

        test = self.tests[test_id]
        if variant_name not in test.metrics:
            raise ValueError(f"Variant {variant_name} not found")

        test.metrics[variant_name].update(approved, response_time, satisfaction_score)

    def get_test_results(self, test_id: str) -> Dict[str, Any]:
        """Get current test results and statistics"""
        if test_id not in self.tests:
            raise ValueError(f"Test {test_id} not found")

        test = self.tests[test_id]
        results = {
            "test_id": test.test_id,
            "name": test.name,
            "status": test.status.value,
            "created_at": test.created_at,
            "variants": [],
        }

        for variant in test.variants:
            metrics = test.metrics[variant.name]
            results["variants"].append(
                {
                    "name": variant.name,
                    "description": variant.description,
                    "total_requests": metrics.total_requests,
                    "approvals": metrics.approvals,
                    "rejections": metrics.rejections,
                    "conversion_rate": round(metrics.conversion_rate * 100, 2),
                    "avg_response_time": round(metrics.avg_response_time, 3),
                    "avg_satisfaction_score": round(metrics.avg_satisfaction_score, 2),
                    "config": variant.config,
                }
            )

        # Calculate winner if enough samples
        total_samples = sum(m.total_requests for m in test.metrics.values())
        if total_samples >= test.min_sample_size:
            winner = max(
                test.metrics.items(),
                key=lambda x: x[1].conversion_rate,
            )
            results["winner"] = winner[0]
            results["winner_conversion"] = round(winner[1].conversion_rate * 100, 2)

        return results

    def stop_test(self, test_id: str):
        """Stop a running test"""
        if test_id not in self.tests:
            raise ValueError(f"Test {test_id} not found")

        test = self.tests[test_id]
        test.status = TestStatus.COMPLETED
        test.ended_at = datetime.now().isoformat()
        self.active_test = None

    def get_active_test(self) -> Optional[ABTest]:
        """Get currently active test"""
        if self.active_test and self.active_test in self.tests:
            return self.tests[self.active_test]
        return None

    def list_tests(self, status: Optional[TestStatus] = None) -> List[Dict[str, Any]]:
        """List all tests, optionally filtered by status"""
        tests_list = []
        for test in self.tests.values():
            if status and test.status != status:
                continue
            results = self.get_test_results(test.test_id)
            tests_list.append(results)
        return tests_list

    def export_results(self, test_id: str) -> str:
        """Export test results as JSON"""
        results = self.get_test_results(test_id)
        return json.dumps(results, indent=2)


# Pre-configured test templates

def create_agent_strategy_test() -> ABTest:
    """Test different agent prompt strategies"""
    variants = [
        Variant(
            name="Conservative Strategy",
            description="Lower approval rate, stricter criteria",
            config={
                "credit_score_min": 750,
                "emi_ratio_max": 40,
                "approval_bias": "conservative",
            },
            traffic_weight=0.5,
        ),
        Variant(
            name="Aggressive Strategy",
            description="Higher approval rate, relaxed criteria",
            config={
                "credit_score_min": 600,
                "emi_ratio_max": 60,
                "approval_bias": "aggressive",
            },
            traffic_weight=0.5,
        ),
    ]

    return ABTest(
        test_id="strategy_001",
        name="Agent Approval Strategy Test",
        description="Compare conservative vs aggressive approval strategies",
        hypothesis="Aggressive strategy will have higher conversion but potentially higher default risk",
        variants=variants,
        min_sample_size=200,
    )


def create_communication_style_test() -> ABTest:
    """Test different agent communication styles"""
    variants = [
        Variant(
            name="Formal Communication",
            description="Professional, formal tone",
            config={"tone": "formal", "use_jargon": True, "empathy_level": 0.3},
            traffic_weight=0.5,
        ),
        Variant(
            name="Conversational Communication",
            description="Friendly, conversational tone",
            config={"tone": "conversational", "use_jargon": False, "empathy_level": 0.8},
            traffic_weight=0.5,
        ),
    ]

    return ABTest(
        test_id="communication_001",
        name="Communication Style Test",
        description="Compare formal vs conversational agent communication",
        hypothesis="Conversational tone will result in higher satisfaction scores",
        variants=variants,
        min_sample_size=150,
    )


# Global instance
ab_testing_framework = ABTestingFramework()
