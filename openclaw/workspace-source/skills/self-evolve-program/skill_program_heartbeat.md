# Heartbeat Skill Optimization Program

## Objective
Improve heartbeat skill's precision, token efficiency, and clarity.

## Success Metrics
- Clarity: improved specificity of rules (more concrete numbers/thresholds)
- Token efficiency: shorter output for no-op cycles
- Completeness: all 5 optimization goals addressed

## Constraints
1. **Fixed time budget**: 3 minutes per experiment
2. **Single file edit**: Only edit SKILL.md or supporting .md files in heartbeat/
3. **Preserve structure**: Keep the 7 core rules + common traps sections
4. **Log everything**: Record each change

## Experiment Protocol
1. Make ONE targeted change to improve heartbeat skill
2. Score: does it make the rule more specific/actionable?
3. If improvement → keep
4. If no clear improvement → discard
5. Repeat until 3 minutes exhausted

## Change Ideas (priority order)
1. Add concrete examples to HEARTBEAT_OK definition (what "nothing actionable" looks like)
2. Add a "token budget" note in Core Rules section recommending max output lines for no-op
3. Make "escalation rules" more concrete: add example cooldown periods (15min, 1hr, 4hr)
4. Add cron vs heartbeat decision tree with specific examples
5. Add state tracking guidance: use a JSON file to avoid re-checking same items
6. Tighten "active hours" rule with concrete timezone handling example
7. Reduce redundant preamble in output guidance — shorter boilerplate
