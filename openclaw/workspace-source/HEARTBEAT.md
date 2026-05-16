# HEARTBEAT

## Objective
Keep the user informed about important updates while minimizing noisy checks and unnecessary API costs.

## Runtime Contract
- If no actionable event is found: return exactly `HEARTBEAT_OK`
- If actionable: return concise action output and next-step recommendation

## Timing
- timezone: Asia/Shanghai
- activeHours: 08:00-23:00
- defaultInterval: 30m
- burstInterval: 10m (only during active incidents)

## Monitors
1. **Email check** (cheap precheck)
   - Trigger only if unread urgent >= 1
   
2. **Calendar proximity** (cheap precheck)
   - Trigger only if next_event_minutes <= 60

3. **Weather check** (cheap precheck)
   - Trigger only if user might go out (optional, context-dependent)

## Escalation and Cooldown
- Critical (urgent email/calendar): escalate immediately, cooldown 15m
- Important update: aggregate and send every 60m max
- Duplicate events during cooldown: suppress

## Cron Handoff
- Exact-time daily tasks (e.g., 09:00) -> cron
- Recurring scheduled reports -> cron

## Cost Guardrails
- Never call paid APIs unless precheck threshold is met
- If paid API is needed, cap to one call per cycle category

## Weekly Tuning
- If monitor signal quality < 20% for 7 days, extend interval
- If missed-event rate > 10%, shorten interval or add monitor

## Event Handlers

### (暂无定时任务)
