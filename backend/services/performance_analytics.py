"""
Agent Performance Analytics and Metrics Tracking
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Any
from enum import Enum


class AgentMetricType(str, Enum):
    RESPONSE_TIME = "response_time"
    SUCCESS_RATE = "success_rate"
    ERROR_RATE = "error_rate"
    CUSTOMER_SATISFACTION = "customer_satisfaction"
    CONVERSION_RATE = "conversion_rate"


@dataclass
class AgentMetric:
    agent_type: str
    metric_type: AgentMetricType
    value: float
    timestamp: datetime = field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class AgentPerformance:
    agent_type: str
    total_requests: int = 0
    successful_requests: int = 0
    failed_requests: int = 0
    avg_response_time: float = 0.0
    avg_satisfaction_score: float = 0.0
    approval_rate: float = 0.0
    metrics: List[AgentMetric] = field(default_factory=list)

    @property
    def success_rate(self) -> float:
        if self.total_requests == 0:
            return 0.0
        return (self.successful_requests / self.total_requests) * 100

    @property
    def error_rate(self) -> float:
        return 100 - self.success_rate

    def to_dict(self) -> Dict[str, Any]:
        return {
            "agent_type": self.agent_type,
            "total_requests": self.total_requests,
            "successful_requests": self.successful_requests,
            "failed_requests": self.failed_requests,
            "avg_response_time": round(self.avg_response_time, 2),
            "success_rate": round(self.success_rate, 2),
            "error_rate": round(self.error_rate, 2),
            "avg_satisfaction_score": round(self.avg_satisfaction_score, 2),
            "approval_rate": round(self.approval_rate, 2)
        }


class PerformanceTracker:
    """Tracks performance metrics for all agents"""

    def __init__(self):
        self.agent_metrics: Dict[str, AgentPerformance] = {}

    def track_request(self, agent_type: str, success: bool, response_time: float, metadata: Dict[str, Any] = None):
        """Track a single agent request"""
        if agent_type not in self.agent_metrics:
            self.agent_metrics[agent_type] = AgentPerformance(agent_type=agent_type)

        perf = self.agent_metrics[agent_type]
        perf.total_requests += 1

        if success:
            perf.successful_requests += 1
        else:
            perf.failed_requests += 1

        # Update average response time
        perf.avg_response_time = (
            (perf.avg_response_time * (perf.total_requests - 1) + response_time) / perf.total_requests
        )

        # Track metric
        metric = AgentMetric(
            agent_type=agent_type,
            metric_type=AgentMetricType.RESPONSE_TIME,
            value=response_time,
            metadata=metadata or {}
        )
        perf.metrics.append(metric)

    def get_agent_performance(self, agent_type: str = None) -> Dict[str, Any]:
        """Get performance data for specific agent or all agents"""
        if agent_type:
            if agent_type not in self.agent_metrics:
                return {}
            return self.agent_metrics[agent_type].to_dict()

        return {
            agent: perf.to_dict()
            for agent, perf in self.agent_metrics.items()
        }

    def get_leaderboard(self) -> List[Dict[str, Any]]:
        """Get agent leaderboard ranked by success rate"""
        return sorted(
            [perf.to_dict() for perf in self.agent_metrics.values()],
            key=lambda x: x['success_rate'],
            reverse=True
        )


# Global tracker instance
performance_tracker = PerformanceTracker()
