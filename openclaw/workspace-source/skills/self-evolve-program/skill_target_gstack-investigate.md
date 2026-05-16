# GStack Investigate Skill Optimization Target

## Current State
- Skill: gstack-investigate (installed at ~/.agents/skills/gstack-investigate)
- Focus: Improve clarity, reduce preamble length, make debug flow more actionable

## Optimization Goals
1. **Preamble reduction**: The preamble (run first section) is extremely long. The key environmental checks could be condensed from ~50 lines to ~15 lines.
2. **Phase clarity**: The 4 phases (investigate, analyze, hypothesize, implement) are good but Phase 2 "Pattern Analysis" table is too generic.
3. **Iron Law emphasis**: "NO FIXES WITHOUT ROOT CAUSE" is the most important message — make it visually prominent.
4. **AskUserQuestion format**: The complex format in preamble adds value but is buried. Keep it for Phase 1 but condense the preamble itself.
5. **Verification**: Phase 5 says "fresh verification" is not optional — but doesn't give a concrete command to run.

## Target Metrics
- Clarity: improved scan-ability for time-pressured debugging
- Preamble length: target reduction from ~50 lines to ~25 lines
- Completeness: all 5 optimization goals addressed

## Constraints
- Do not remove the telemetry logging (required by gstack)
- Do not remove the PROACTIVE/SKILL_PREFIX checks (user preferences)
- Keep AskUserQuestion format structure
- Keep the 5-phase debug flow
- Keep "3+ failed fix attempts → STOP" rule
