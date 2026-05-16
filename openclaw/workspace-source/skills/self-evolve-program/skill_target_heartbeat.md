# Heartbeat Skill Optimization Target

## Current State
- Skill: heartbeat (installed at ~/.agents/skills/heartbeat)
- Current version: 1.0.1
- Focus: Improve output clarity, reduce token burn, make HEARTBEAT_OK more precise

## Optimization Goals
1. **HEARTBEAT_OK contract**: Clarify that "nothing actionable" means no user input + no events + no alerts — not just "no errors"
2. **Token efficiency**: Reduce verbose output in no-op cycles, especially the initial preamble in every heartbeat
3. **Escalation clarity**: Make cooldown and threshold rules more concrete (specific numbers, not just "define them")
4. **Cron handoff**: Add explicit guidance for when to move from heartbeat to cron (exact timing cases)
5. **State tracking**: Add guidance for lightweight state file to avoid redundant checks across cycles

## Target Metrics
- Clarity: 0 = vague/generic, 1 = actionable and precise
- Token efficiency: lower output in no-op cycles
- Completeness: all 7 core rules covered with specific guidance

## Constraints
- Do not break existing file structure (setup.md, memory-template.md, heartbeat-template.md must remain usable)
- Only edit SKILL.md and supporting .md files
- Keep the "7 core rules" and "common traps" sections (proven structure)
