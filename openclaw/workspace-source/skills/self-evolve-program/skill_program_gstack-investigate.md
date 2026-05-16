# GStack Investigate Skill Optimization Program

## Objective
Streamline gstack-investigate skill for faster scanning during debug sessions, reduce preamble verbosity while preserving key functionality.

## Success Metrics
- Clarity: improved scan-ability
- Preamble reduction: target 50% shorter (from ~50 lines to ~25)
- Completeness: all 5 optimization goals addressed

## Constraints
1. **Fixed time budget**: 3 minutes per experiment
2. **Single file edit**: Only edit SKILL.md
3. **Preserve telemetry**: Keep all telemetry logging
4. **Preserve preferences**: Keep PROACTIVE/SKILL_PREFIX/ROUTING checks
5. **Preserve 5-phase flow**: Keep the core debug methodology
6. **Log everything**: Record each change

## Experiment Protocol
1. Make ONE targeted change to streamline or clarify gstack-investigate
2. Score: does it reduce length or improve clarity without losing function?
3. If improvement → keep
4. If no clear improvement → discard
5. Repeat until 3 minutes exhausted

## Change Ideas (priority order)
1. Condense preamble environmental checks: merge related echo commands, remove redundant spacing
2. Add visual marker (===) before Iron Law section to make it impossible to miss
3. Merge Phase 2 Pattern Analysis table with "Also check" section (they overlap)
4. Add concrete example to Phase 5 verification command: "Run: npm test -- <test-file>"
5. Reduce blank lines in preamble (every 2nd blank line unnecessary)
6. Remove the "context recovery" long block — compress to 5 key checks
7. Shorten "Voice" section — keep the key style rules, remove the extended rationales
8. Simplify the "Plan Mode Safe Operations" section (it's long and most users skip it)
