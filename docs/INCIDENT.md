# INCIDENT

## Problem
Users report:
- AI forgets earlier answers
- Response time increased to 12 seconds

## Investigation

1. Check application metrics
2. Measure OpenAI latency
3. Inspect token counts
4. Review DB query timings
5. Trace a slow request

## Likely Cause
Entire conversation history is being sent to the model on every request.

## Fix
Move to snapshot-based memory.

Send:
- Current structured will snapshot
- Latest user message

instead of full chat history.

## Prevention
- Token monitoring
- Request tracing
- Latency dashboards
- Alerting on response time degradation