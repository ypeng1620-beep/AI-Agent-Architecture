# self-evolve-program Skill Optimization Program

## Objective
Improve self-evolve-program's documentation clarity, runner robustness, and integration with skill-tester.

## Success Metrics
- Test pass rate: 100% (higher is better)
- Documentation completeness
- Runner robustness (handles missing files gracefully)

## Constraints
1. **Fixed time budget**: 2 minutes per experiment
2. **Single file edit**: Only edit SKILL.md, run.cjs, or evaluator.cjs
3. **Preserve tests**: All existing tests must still pass
4. **Log everything**: Record each change and its impact

## Experiment Protocol
1. Make ONE change to improve the skill
2. Run tests: `node skill-tester/test_runner.cjs --skill=self-evolve-program`
3. Score based on: test pass rate + code quality improvement
4. If tests pass → keep change
5. If tests fail → discard change
6. Repeat until 2 minutes exhausted or no more ideas

## Change Ideas (in priority order)
1. Add better error handling for missing program/target files
2. Add --help option to run.cjs
3. Add JSON output option for programmatic use
4. Improve evaluator.cjs to do real scoring
5. Add experiment counter to prevent infinite loops

## Experiment Log
Record for each experiment:
- Change made
- Test result (pass/fail)
- Decision (keep/discard)
