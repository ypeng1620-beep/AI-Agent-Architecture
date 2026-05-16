---
name: skill-tester
description: Testing framework for OpenClaw skills, based on claw-code's workspace test philosophy. Makes skill behavior deterministic and reproducible.
metadata:
  openclaw:
    emoji: "🧪"
    homepage: https://github.com/ypeng1620/skill-tester
    install:
      - id: "skill-tester-scripts"
        kind: "local"
        label: "Scripts bundled with skill"
---

# skill-tester

Based on **claw-code's workspace test philosophy** (⭐180K) — Make AI coding behavior **deterministic, testable, and repeatable**.

## Core Inspiration

```
Traditional tests:  Input → Expected Output → Pass/Fail
claw-code tests:    Workspace state → Agent action → Verified state change
```

## When to Use

- **Before publishing** a skill: Ensure it works correctly
- **After updates**: Verify existing functionality still works
- **Continuous Integration**: Catch regressions automatically
- **Debugging**: Reproduce and verify bug fixes

## Architecture

```
skill_tester/
├── test_runner.js     # Main test orchestrator
├── assert.js          # Assertion library
├── fixtures/          # Test fixtures (input files, mocks)
├── skills/            # Skills under test
└── reports/           # Test results
```

## Quick Start

### 1. Create a test file

```javascript
// tests/my_skill.test.cjs (use .cjs extension in ES module workspaces)
const { test, assert } = require('skill-tester');

test('should convert PDF to markdown', async (ctx) => {
  const result = await ctx.runSkill('markitdown', {
    file: 'fixtures/test.pdf'
  });
  
  assert.ok(result.output, 'Should have output');
  assert.contains(result.output, 'expected text');
  assert.equals(result.exitCode, 0);
});

module.exports = { test, assert };
// Or export individual tests:
module.exports = {
  'test name': function(ctx) { ... },
  'another test': function(ctx) { ... }
};
```

### 2. Run tests

```bash
# Run all tests for a skill
node test_tester/test_runner.cjs --skill=markitdown

# Run with verbose output
node test_tester/test_runner.cjs --skill=markitdown --verbose

# Run with coverage
node test_tester/test_runner.cjs --skill=markitdown --coverage

# Run in CI mode (exit code 1 on failure)
node test_tester/test_runner.cjs --skill=markitdown --ci
```

### 3. Review report

```
🧪 skill-tester report: markitdown
   Total: 12 tests
   ✅ Passed: 10
   ❌ Failed: 2
   ⏱️  Duration: 45s
```

## Test Runner

```javascript
// test_runner.js
const { TestRunner } = require('skill-tester');

const runner = new TestRunner({
  skills: ['markitdown', 'akshare-stock'],
  verbose: true,
  coverage: true
});

await runner.run();
await runner.report();
```

## Assertions

| Assertion | Description |
|-----------|-------------|
| `assert.equals(actual, expected)` | Exact equality |
| `assert.deepEquals(actual, expected)` | Deep equality (objects) |
| `assert.ok(value, msg)` | Truthy check |
| `assert.contains(str, substr)` | Substring check |
| `assert.matches(str, regex)` | Regex match |
| `assert.rejects(asyncFn)` | Promise should reject |
| `assert.eventually(promise, checker)` | Async assertion |

## Fixtures

Test fixtures live in `fixtures/` directory:

```
fixtures/
├── pdfs/           # PDF files for conversion tests
├── jsons/          # JSON mock data
├── images/         # Images for OCR tests
└── scripts/        # Helper scripts
```

Reference fixtures in tests:

```javascript
const PDF_FIXTURE = ctx.fixture('pdfs/sample.pdf');
```

## Integration with CI/CD

```yaml
# .github/workflows/skill-test.yml
name: Skill Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run skill tests
        run: node skill_tester/test_runner.js --ci
      - name: Upload reports
        uses: actions/upload-artifact@v2
        if: always()
        with:
          name: test-reports
          path: skill_tester/reports/
```

## Test Categories

| Category | Purpose |
|----------|---------|
| `unit` | Single function/module test |
| `integration` | Skill + external service |
| `e2e` | Full workflow test |
| `regression` | Bug fix verification |

## Coverage

Generate coverage reports:

```bash
node test_runner.cjs --coverage --report=html
```

Coverage report shows:
- Which skill functions are tested
- Which are never tested (risk areas)
- Overall coverage percentage

## claw-code Principles Applied

| claw-code | skill-tester |
|-----------|--------------|
| Deterministic CLI output | Deterministic skill output |
| Workspace test suite | Skill test suite |
| `claw doctor` | `skill-tester health` |
| Session management | Test context isolation |
| Mock harness | Fixture mocking |

## Comparison

| Before (承安) | After (skill-tester) |
|-------------|---------------------|
| "Seems to work" | "Tests pass ✓" |
| Manual verification | Automated checks |
| Unpredictable behavior | Deterministic results |
| No regression detection | CI catches issues |
| Skill confidence: gut feel | Skill confidence: 95%+ coverage |

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | This file |
| `test_runner.cjs` | Main test orchestrator |
| `assert.cjs` | Assertion library |
| `context.js` | Test context (fixtures, mocks) |
| `reporter.js` | Test result reporting |
| `health.cjs` | `skill-tester health` command |

## See Also

- [claw-code](https://github.com/ultraworkers/claw-code) — Original inspiration
- [e2e-testing-patterns](../e2e-testing-patterns) — E2E testing patterns
- [error-recovery](../error-recovery) — Testing error handling
