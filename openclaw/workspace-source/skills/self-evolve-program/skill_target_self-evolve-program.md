---
name: self-evolve-program
description: Self-evolution skill based on karpathy/autoresearch's program.md loop. Fixed time budget → experiment → evaluate → keep best. Applies to skill optimization.
metadata:
  openclaw:
    emoji: "🧬"
    homepage: https://github.com/ypeng1620/self-evolve-program
    install:
      - id: "self-evolve-program-scripts"
        kind: "local"
        label: "Scripts bundled with skill"
---

# self-evolve-program Skill

Based on **karpathy/autoresearch** (⭐70K) — AI runs autonomous experiments within a fixed time budget, keeps the best result.

## Core Inspiration

```
program.md (instructions) → Agent edits target → Fixed time run → Evaluate → Keep/Discard → Repeat
```

## When to Use

- Optimize any skill's effectiveness (response quality, speed)
- Self-improve OpenClaw agent behavior within a time box
- Run A/B tests on different skill strategies

## Architecture

```
skill_program.md     — Your optimization instructions (YOU edit this)
skill_target.md     — What to optimize (Agent edits this)
skill_runner.sh     — Fixed time budget runner
skill_evaluator.js — Evaluate result quality
```

## Quick Start

### 1. Define your optimization target

Edit `skill_program.md` with instructions like:

```
Optimize my stock analysis skill:
- Focus on: accuracy of buy/sell signals
- Metric: historical backtest win rate
- Time budget: 10 minutes per experiment
```

### 2. Run the self-evolution loop

```bash
# From the skill directory:
node run.cjs --target=wing_stock --budget=10m

# Or from workspace root:
node skills/self-evolve-program/run.cjs --target=wing_stock --budget=10m
```

### 3. Review results

The runner will produce `output/evolution_log.md` with:
- All experiments with timestamps
- Scores for each run
- Best configuration saved to `output/best_<target>.md`

## Output Directory

```
output/
├── best_<target>.md     # Best result found (updated when improvement found)
└── evolution_log.md     # Log of all experiments
```

| File | Purpose |
|------|---------|
| `SKILL.md` | This file |
| `run.cjs` | Main runner with time budget |
| `evaluator.cjs` | Score and compare results |
| `skill_program.md` | Template for optimization instructions |
| `output/best_*.md` | Best result per target |
| `output/evolution_log.md` | Log of all experiments |

## Implementation

### skill_program.md (human-edited, stable)

```markdown
# Skill Optimization Program

## Objective
[Describe what to optimize]

## Success Metric
[How to measure improvement]

## Constraints
- Fixed time budget per run
- Only edit ONE file at a time
- Log everything

## Experiment Protocol
1. Make one change
2. Run for fixed time
3. Score result
4. Keep or discard
5. Repeat
```

### skill_target.md (agent-edited, changes each experiment)

The file containing the thing being optimized.

### Fixed Time Budget

Default: **5 minutes** (inspired by autoresearch)

```javascript
// run.cjs - Fixed time budget runner
const TIME_BUDGET_MS = 5 * 60 * 1000;
const METRIC = 'val_bpb'; // lower is better
```

### Evaluation

```javascript
// evaluator.cjs
function evaluate(baseline, candidate) {
  // Return: { improved: boolean, score: number }
  // lower score = better for metrics like loss
  // higher score = better for metrics like accuracy
}
```

## Integration with OpenClaw

This skill runs as a subagent task:

```
User: Optimize my research skill
→ spawn self-evolve-program with target=research
→ run fixed-budget experiments
→ report best configuration
→ auto-update skill config
```

## Key Design Principles

| Principle | From | Why |
|-----------|------|-----|
| Fixed time budget | autoresearch | Makes experiments comparable regardless of changes |
| Single file to edit | autoresearch | Keeps diffs reviewable, scope manageable |
| program.md = instructions | autoresearch | Decouples human intent from agent action |
| Wake up to results | autoresearch | Agent works while you sleep |

## Comparison with Current System

| Current (承安) | With self-evolve-program |
|----------------|-------------------------|
| Passive optimization | Active overnight experiments |
| Manual skill updates | Agent-driven skill evolution |
| No benchmark loop | Fixed-budget eval loop |
| Human edits everything | Human sets program, agent edits target |

## See Also

- [karpathy/autoresearch](https://github.com/karpathy/autoresearch) — Original inspiration
- [xiucheng-self-improving-agent](../xiucheng-self-improving-agent) — OpenClaw self-improvement agent
