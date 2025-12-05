# Advanced Features Integration Guide

This guide explains how to integrate the new advanced features (Rules Engine, A/B Testing, Performance Analytics) into Project Orion.

## Overview of New Components

### 1. **Business Rules Engine** (`backend/services/rules_engine.py`)
- Dynamic rule management system
- No-code rule creation and modification
- Supports various rule types and operators
- Real-time rule evaluation for loan approvals

### 2. **A/B Testing Framework** (`backend/services/ab_testing.py`)
- Compare different agent strategies
- Statistical significance testing
- Variant traffic allocation
- Performance metrics tracking

### 3. **Performance Analytics** (`backend/services/performance_analytics.py`)
- Per-agent metrics tracking
- Leaderboard generation
- Historical metric tracking
- Custom metric types

### 4. **Frontend Components**
- **rules-editor.tsx**: UI for managing business rules
- **ab-testing-dashboard.tsx**: Dashboard for A/B tests
- New hooks: `useRulesEngine()`, `useABTests()`

### 5. **API Routes** (`backend/routes_extended.py`)
- Rules management endpoints
- A/B testing endpoints
- Analytics endpoints
- Combined decision-making endpoints

---

## Integration Steps

### Step 1: Update Backend Package Installation

Add required Python packages to `backend/requirements.txt`:

```
fastapi
pydantic
python-dateutil
numpy  # For statistical calculations
```

Then install:
```bash
pip install -r backend/requirements.txt
```

### Step 2: Integrate Rules Engine with Orchestrator

In `backend/agents/orchestrator.py`:

```python
from backend.services.rules_engine import rules_engine

# In UnderwritingAgent, replace hardcoded rules with:
async def _handle_underwriting(self, context):
    # ... existing code ...
    
    # Evaluate using rules engine
    evaluation_context = {
        "credit_score_min": customer.credit_score,
        "emi_income_ratio": (monthly_emi / customer.monthly_salary) * 100,
        "amount_vs_preapproved": loan_amount / customer.preApprovedLimit,
        # ... other context fields ...
    }
    
    decision, reason = rules_engine.evaluate_all(evaluation_context)
    
    return {
        "status": "underwriting_complete",
        "decision": decision,
        "reason": reason,
        # ... rest of response ...
    }
```

### Step 3: Integrate Performance Analytics with Agents

In `backend/agents/orchestrator.py`:

```python
from backend.services.performance_analytics import performance_tracker
import time

async def process(self, message, context):
    """Main message processing"""
    start_time = time.time()
    
    try:
        # ... existing agent logic ...
        response = await self._handle_message()
        
        # Track success
        elapsed = time.time() - start_time
        performance_tracker.track_request(
            agent_name="master_agent",
            action="process_message",
            success=True,
            response_time=elapsed
        )
        
        return response
    except Exception as e:
        elapsed = time.time() - start_time
        performance_tracker.track_request(
            agent_name="master_agent",
            action="process_message",
            success=False,
            response_time=elapsed
        )
        raise
```

### Step 4: Integrate A/B Testing with Message Processing

In `backend/agents/orchestrator.py`:

```python
from backend.services.ab_testing import ab_testing_framework

async def process(self, message, context):
    """Main message processing with A/B testing"""
    
    # Get active test
    active_test = ab_testing_framework.get_active_test()
    
    if active_test:
        # Assign user to variant
        variant_name = ab_testing_framework.assign_variant(active_test.test_id)
        variant = next(v for v in active_test.variants if v.name == variant_name)
        
        # Apply variant configuration
        self._apply_variant_config(variant.config)
    
    # Process normally
    start_time = time.time()
    response = await self._handle_message(message)
    elapsed = time.time() - start_time
    
    # Record test result if active
    if active_test:
        approved = response.get("status") == "approved"
        ab_testing_framework.record_result(
            test_id=active_test.test_id,
            variant_name=variant_name,
            approved=approved,
            response_time=elapsed,
            satisfaction_score=response.get("satisfaction", 0.0)
        )
    
    return response
```

### Step 5: Add FastAPI Routes

In your main FastAPI app (`backend/index.ts` or `backend/main.py`):

```python
from fastapi import FastAPI
from backend.routes_extended import router as extended_router

app = FastAPI()

# Include extended routes
app.include_router(extended_router)
```

### Step 6: Integrate Frontend Components into Existing Pages

In `client/src/pages/agentic-mode.tsx`:

```tsx
import RulesEditor from '../components/rules-editor';
import ABTestingDashboard from '../components/ab-testing-dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export default function AgenticMode() {
  // ... existing component logic ...

  return (
    <div>
      <Tabs defaultValue="chat">
        <TabsList>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="rules">Rules Engine</TabsTrigger>
          <TabsTrigger value="tests">A/B Tests</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat">
          {/* Existing chat interface */}
        </TabsContent>
        
        <TabsContent value="rules">
          <RulesEditor />
        </TabsContent>
        
        <TabsContent value="tests">
          <ABTestingDashboard />
        </TabsContent>
        
        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Step 7: Create Analytics Dashboard Component

Create `client/src/components/analytics-dashboard.tsx`:

```tsx
import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics');
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading analytics...</div>;

  // Render leaderboard, charts, metrics...
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h2 className="text-2xl font-bold mb-4">Agent Performance Leaderboard</h2>
        {/* Leaderboard content */}
      </Card>
    </div>
  );
};
```

---

## Usage Examples

### Creating a Custom Rule

```python
from backend.services.rules_engine import BusinessRule, RuleType, RuleOperator

# Create rule programmatically
new_rule = BusinessRule(
    name="High EMI Check",
    rule_type=RuleType.EMI_INCOME_RATIO,
    operator=RuleOperator.LESS_EQUAL,
    threshold=45,
    action="APPROVE",
    priority=95,
    description="EMI should not exceed 45% of monthly income"
)

rules_engine.add_rule(new_rule)
```

### Starting an A/B Test

```python
from backend.services.ab_testing import (
    ab_testing_framework, 
    create_agent_strategy_test,
    Variant
)

# Use template
test = create_agent_strategy_test()
ab_testing_framework.create_test(
    test_id="test_002",
    name=test.name,
    description=test.description,
    hypothesis=test.hypothesis,
    variants=test.variants
)

# Or create custom
custom_test = ab_testing_framework.create_test(
    test_id="custom_test",
    name="Custom Comparison",
    description="Testing new feature X",
    hypothesis="Feature X improves approval rate",
    variants=[
        Variant(
            name="With Feature X",
            description="Using new feature",
            config={"feature_x_enabled": True},
            traffic_weight=0.5
        ),
        Variant(
            name="Without Feature X",
            description="Control group",
            config={"feature_x_enabled": False},
            traffic_weight=0.5
        ),
    ]
)
```

### Tracking Performance

```python
from backend.services.performance_analytics import performance_tracker

# Track request
performance_tracker.track_request(
    agent_name="sales_agent",
    action="emi_calculation",
    success=True,
    response_time=0.150,
    metadata={"loan_amount": 500000}
)

# Get agent stats
stats = performance_tracker.get_agent_performance("sales_agent")
print(f"Success Rate: {stats.success_rate * 100}%")
print(f"Avg Response Time: {stats.avg_response_time:.3f}s")

# Get leaderboard
leaderboard = performance_tracker.get_leaderboard()
for agent_stats in leaderboard:
    print(f"{agent_stats.agent_name}: {agent_stats.success_rate * 100}%")
```

---

## API Endpoints Quick Reference

### Rules Engine
- `GET /api/rules` - Get all rules
- `POST /api/rules` - Create new rule
- `PUT /api/rules/{name}` - Update rule
- `DELETE /api/rules/{name}` - Delete rule
- `POST /api/rules/evaluate` - Evaluate context against rules

### A/B Testing
- `GET /api/tests` - List all tests
- `POST /api/tests` - Create new test
- `GET /api/tests/{test_id}` - Get test results
- `PUT /api/tests/{test_id}` - Stop/pause test
- `POST /api/tests/{test_id}/record` - Record result
- `GET /api/tests/{test_id}/export` - Export results

### Analytics
- `GET /api/analytics` - Get metrics
- `GET /api/analytics/agents` - Get leaderboard
- `GET /api/analytics/agents/{name}` - Get agent metrics
- `POST /api/analytics/track` - Track request

### Combined
- `POST /api/decisions` - Make decision with rules + tracking
- `GET /api/dashboard` - Get dashboard summary

---

## Testing Checklist

- [ ] Rules engine creates rules without errors
- [ ] Rules evaluate correctly for different contexts
- [ ] A/B test variants assigned with correct traffic weight
- [ ] Performance metrics tracked for all agents
- [ ] Leaderboard shows agents sorted by success rate
- [ ] Frontend components load and fetch data
- [ ] Rules editor allows creating/updating/deleting rules
- [ ] A/B dashboard displays test results with charts
- [ ] API endpoints return correct responses
- [ ] Error handling works for invalid inputs

---

## File Structure Summary

```
backend/
  services/
    rules_engine.py          # ✅ NEW - Rules management
    ab_testing.py            # ✅ NEW - A/B testing framework
    performance_analytics.py # ✅ NEW - Performance tracking
  routes_extended.py         # ✅ NEW - Extended API routes

client/src/components/
  rules-editor.tsx           # ✅ NEW - UI for rules
  ab-testing-dashboard.tsx   # ✅ NEW - A/B testing UI
  analytics-dashboard.tsx    # (CREATE) Analytics UI
  ...existing components
```

---

## Next Steps

1. **Test Integration**: Start with rules engine integration first
2. **Add Analytics**: Wire performance tracking into orchestrator
3. **Enable A/B Testing**: Add to message processing flow
4. **Create Admin UI**: Build admin dashboard for rule/test management
5. **Real CRM Integration**: Connect to actual CRM data
6. **Database Migration**: Replace mock storage with PostgreSQL

---

## Support & Troubleshooting

### Rules not evaluating correctly?
- Check that context keys match rule_type values
- Verify operator logic in `BusinessRule.evaluate()`
- Use `/api/rules/evaluate` endpoint to test

### A/B Test not recording results?
- Ensure `ab_testing_framework.assign_variant()` is called
- Check that variant names match in `record_result()`
- Verify active test status is "RUNNING"

### Performance metrics missing?
- Call `performance_tracker.track_request()` after each operation
- Check agent names match between tracking and queries
- Verify response_time is in seconds (not milliseconds)

