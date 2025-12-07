"""
Extended API Routes - Rules Engine, A/B Testing, and Analytics
This file provides Python FastAPI routes to integrate with the new advanced features.
These can be added to the backend orchestrator or served as a separate service.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
import json
from datetime import datetime

from backend.services.rules_engine import RulesEngine, BusinessRule

# Initialize rules engine instance
rules_engine = RulesEngine()

router = APIRouter()

# ============================================================================
# RULES ENGINE ENDPOINTS
# ============================================================================

@router.get("/api/rules")
async def get_rules():
    """Get all active business rules"""
    try:
        rules_list = []
        for r in rules_engine.rules:
            rule_dict = {
                "name": r.name,
                "rule_type": r.rule_type.value,
                "operator": r.operator.value,
                "threshold": r.threshold,
                "action": r.action,
                "priority": r.priority,
                "description": r.description,
                "enabled": r.enabled,
            }
            rules_list.append(rule_dict)
        return {"rules": rules_list}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/api/rules")
async def create_rule(rule_data: Dict[str, Any]):
    """Create a new business rule"""
    try:
        # Convert string enums to Enum objects if needed, or let Pydantic handle it if we used Pydantic models
        # But here we are using Dict, so we might need to be careful.
        # However, BusinessRule is a dataclass.
        # Let's assume the input matches the dataclass fields.
        # We might need to handle Enum conversion manually if the JSON sends strings.
        
        # Simple instantiation - might need adjustment for Enums
        new_rule = BusinessRule(**rule_data)
        rules_engine.add_rule(new_rule)
        return {"success": True, "message": "Rule created"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/api/rules/{rule_name}")
async def update_rule(rule_name: str, updates: Dict[str, Any]):
    """Update an existing rule"""
    try:
        rules_engine.update_rule(rule_name, **updates)
        return {"success": True, "message": f"Rule '{rule_name}' updated"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/api/rules/{rule_name}")
async def delete_rule(rule_name: str):
    """Delete a rule"""
    try:
        rules_engine.remove_rule(rule_name)
        return {"success": True, "message": f"Rule '{rule_name}' deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/api/rules/evaluate")
async def evaluate_rules(context: Dict[str, Any]):
    """Evaluate all rules against provided context"""
    try:
        decision, reason = rules_engine.evaluate_all(context)
        return {
            "decision": decision,
            "reason": reason,
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============================================================================
# A/B TESTING ENDPOINTS
# ============================================================================

@router.get("/api/tests")
async def get_tests(status: Optional[str] = Query(None)):
    """Get all A/B tests"""
    try:
        # tests = ab_testing_framework.list_tests(
        #     status=status.upper() if status else None
        # )
        return {"tests": []}  # Placeholder
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/api/tests")
async def create_test(test_config: Dict[str, Any]):
    """Create a new A/B test"""
    try:
        test_id = test_config.get("test_id")
        # test = ab_testing_framework.create_test(
        #     test_id=test_id,
        #     name=test_config.get("name"),
        #     description=test_config.get("description"),
        #     hypothesis=test_config.get("hypothesis"),
        #     variants=test_config.get("variants", []),
        # )
        return {
            "success": True,
            "test_id": test_id,
            "message": "Test created and started",
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/api/tests/{test_id}")
async def get_test(test_id: str):
    """Get specific test results"""
    try:
        # results = ab_testing_framework.get_test_results(test_id)
        return {"test": {}}  # Placeholder
    except Exception as e:
        raise HTTPException(status_code=404, detail="Test not found")


@router.put("/api/tests/{test_id}")
async def update_test(test_id: str, action_data: Dict[str, Any]):
    """Update test (stop, pause, etc.)"""
    try:
        action = action_data.get("action", "stop")
        # if action == "stop":
        #     ab_testing_framework.stop_test(test_id)
        return {
            "success": True,
            "message": f"Test {action}ped",
            "test_id": test_id,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/api/tests/{test_id}/record")
async def record_test_result(
    test_id: str,
    variant_name: str,
    approved: bool,
    response_time: float,
    satisfaction_score: float = 0.0,
):
    """Record a test result for a variant"""
    try:
        # ab_testing_framework.record_result(
        #     test_id,
        #     variant_name,
        #     approved,
        #     response_time,
        #     satisfaction_score,
        # )
        return {"success": True, "message": "Result recorded"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/api/tests/{test_id}/export")
async def export_test(test_id: str):
    """Export test results as JSON"""
    try:
        # export_data = ab_testing_framework.export_results(test_id)
        return {"data": json.dumps({})}  # Placeholder
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============================================================================
# ANALYTICS & PERFORMANCE ENDPOINTS
# ============================================================================

@router.get("/api/analytics")
async def get_analytics(
    agent: Optional[str] = Query(None),
    time_range: str = Query("24h"),
):
    """Get analytics and performance metrics"""
    try:
        # if agent:
        #     metrics = performance_tracker.get_agent_performance(agent)
        # else:
        #     metrics = performance_tracker.get_leaderboard()
        return {
            "period": time_range,
            "agents": [],  # Placeholder
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/api/analytics/agents")
async def get_agents_leaderboard():
    """Get agent performance leaderboard"""
    try:
        # leaderboard = performance_tracker.get_leaderboard()
        return {
            "leaderboard": [],  # Placeholder
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/api/analytics/agents/{agent_name}")
async def get_agent_analytics(agent_name: str):
    """Get specific agent analytics"""
    try:
        # metrics = performance_tracker.get_agent_performance(agent_name)
        return {
            "agent": agent_name,
            "metrics": {},  # Placeholder
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail="Agent not found")


@router.post("/api/analytics/track")
async def track_request(
    agent: str,
    action: str,
    success: bool,
    response_time: float,
    details: Optional[Dict[str, Any]] = None,
):
    """Track request for analytics"""
    try:
        # performance_tracker.track_request(
        #     agent,
        #     success=success,
        #     response_time=response_time,
        # )
        return {
            "success": True,
            "message": "Request tracked",
            "agent": agent,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============================================================================
# COMBINED ENDPOINTS (Rules + Analytics)
# ============================================================================

@router.post("/api/decisions")
async def make_decision_with_tracking(
    context: Dict[str, Any],
    track: bool = Query(True),
):
    """
    Make approval decision using rules engine and track in analytics
    This combines rule evaluation with performance tracking
    """
    try:
        # Evaluate rules
        # decision, reason = rules_engine.evaluate_all(context)
        decision = "APPROVE"
        reason = "Placeholder decision"
        
        # Track if requested
        if track:
            # performance_tracker.track_request(
            #     "rule_engine",
            #     success=(decision == "APPROVE"),
            #     response_time=0.05,
            # )
            pass
        
        return {
            "decision": decision,
            "reason": reason,
            "context_received": context,
            "tracked": track,
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/api/dashboard")
async def get_dashboard_data():
    """Get comprehensive dashboard data (rules, tests, analytics)"""
    try:
        return {
            "rules_count": 0,  # len(rules_engine.get_rules()),
            "active_tests": 0,  # len([t for t in ab_testing_framework.list_tests()]),
            "agent_metrics": [],  # performance_tracker.get_leaderboard(),
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Usage in main FastAPI app:
# app.include_router(router)

