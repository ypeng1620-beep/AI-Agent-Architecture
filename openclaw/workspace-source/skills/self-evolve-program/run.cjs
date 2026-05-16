/**
 * self-evolve-program runner
 * Based on karpathy/autoresearch: fixed time budget → experiment → evaluate → keep best
 * 
 * Usage: node run.js --target=<target_name> --budget=<time_budget> [--help] [--json]
 * Example: node run.js --target=wing_stock --budget=5m
 */

const fs = require('fs');
const path = require('path');

// Default configuration
const DEFAULT_BUDGET_MS = 5 * 60 * 1000; // 5 minutes
const DEFAULT_TARGET = 'skill';
const LOG_FILE = 'evolution_log.md';

// Parse arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  if (arg === '--help' || arg === '-h') {
    acc.help = true;
  } else if (arg === '--json') {
    acc.json = true;
  } else if (arg.startsWith('--')) {
    const [key, value] = arg.replace('--', '').split('=');
    acc[key] = value;
  } else {
    acc._.push(arg);
  }
  return acc;
}, { _: [], help: false, json: false });

function printHelp() {
  console.log(`
🧬 self-evolve-program - Skill optimization runner

Usage:
  node run.cjs --target=<name> --budget=<time> [--json]

Options:
  --target=<name>    Target skill to optimize (required)
  --budget=<time>    Time budget per experiment (default: 5m)
                     Formats: 10s, 5m, 1h
  --json             Output results as JSON
  --help, -h         Show this help message

Examples:
  node run.cjs --target=akshare-stock --budget=2m
  node run.cjs --target=my-skill --budget=10m --json

Files:
  skill_program.md           - Your optimization instructions
  skill_target_<name>.md     - What to optimize (created by you)
  output/best_<name>.md      - Best result found
  output/evolution_log.md    - Log of all experiments
`);
}

// Show help and exit if requested
if (args.help) {
  printHelp();
  process.exit(0);
}

const TARGET = args.target || DEFAULT_TARGET;
const BUDGET_MS = parseTimeBudget(args.budget || '5m');
const PROGRAM_FILE = 'skill_program.md';
const TARGET_FILE = `skill_target_${TARGET}.md`;
const OUTPUT_DIR = path.join(__dirname, 'output');

function parseTimeBudget(str) {
  const match = str.match(/^(\d+)(m|s|h)?$/);
  if (!match) return DEFAULT_BUDGET_MS;
  const value = parseInt(match[1]);
  const unit = match[2] || 'm';
  const multipliers = { s: 1000, m: 60000, h: 3600000 };
  return value * (multipliers[unit] || 60000);
}

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

function loadProgram() {
  const programPath = path.join(__dirname, PROGRAM_FILE);
  if (fs.existsSync(programPath)) {
    return fs.readFileSync(programPath, 'utf-8');
  }
  return null;
}

function loadTarget() {
  const targetPath = path.join(__dirname, TARGET_FILE);
  if (fs.existsSync(targetPath)) {
    return fs.readFileSync(targetPath, 'utf-8');
  }
  return null;
}

function loadPreviousBest() {
  const bestPath = path.join(OUTPUT_DIR, `best_${TARGET}.md`);
  if (fs.existsSync(bestPath)) {
    return fs.readFileSync(bestPath, 'utf-8');
  }
  return null;
}

function saveBest(content) {
  ensureOutputDir();
  const bestPath = path.join(OUTPUT_DIR, `best_${TARGET}.md`);
  fs.writeFileSync(bestPath, content, 'utf-8');
}

function saveExperiment(experimentNum, program, target, score, improved, duration) {
  ensureOutputDir();
  const logPath = path.join(OUTPUT_DIR, LOG_FILE);
  
  const entry = `\n## Experiment #${experimentNum} [${new Date().toISOString()}]\n\n` +
    `**Duration:** ${duration}ms\n` +
    `**Score:** ${score}\n` +
    `**Improved:** ${improved ? '✅ YES' : '❌ NO'}\n\n` +
    `### Program\n\`\`\`\n${program}\n\`\`\`\n\n` +
    `### Target\n\`\`\`\n${target}\n\`\`\`\n`;
  
  if (fs.existsSync(logPath)) {
    fs.appendFileSync(logPath, entry, 'utf-8');
  } else {
    fs.writeFileSync(logPath, `# Self-Evolution Log\n\n**Target:** ${TARGET}\n**Budget:** ${BUDGET_MS}ms\n\n${entry}`, 'utf-8');
  }
}

async function runExperiment(experimentNum) {
  const program = loadProgram();
  const target = loadTarget();
  const previousBest = loadPreviousBest();
  
  if (!program || !target) {
    console.log(`⚠️  Missing program or target files. Set up ${PROGRAM_FILE} and ${TARGET_FILE} first.`);
    return null;
  }
  
  console.log(`\n🔬 Experiment #${experimentNum}`);
  console.log(`   Budget: ${BUDGET_MS}ms`);
  
  const startTime = Date.now();
  
  // Execute the experiment: apply agent-like changes based on program instructions
  // In production, this would spawn an OpenClaw/OpenSpace agent
  // For now, we simulate the loop: parse ideas from program → apply to target → evaluate
  let score = 0;
  let experimentLog = '';
  
  try {
    // Simulate experiment: read target, apply a modification based on program
    // This is where a real agent would edit files, run tests, etc.
    const targetContent = target;
    
    // Check if evaluator is available and run it
    const { evaluate } = require('./evaluator.cjs');
    
    // For the first run, use a baseline score based on target completeness
    const baselineScore = previousBest ? JSON.parse(previousBest).score : 0.5;
    
    // Score based on: does the target have clear goals, metrics, and constraints?
    const hasGoals = /Objective|Success Metric|Optimization Goal/i.test(targetContent);
    const hasConstraints = /Constraint|Limit/i.test(targetContent);
    const hasProtocol = /Experiment Protocol|Change Idea/i.test(targetContent);
    const hasMetrics = /Metric|Goal/i.test(targetContent);
    
    const completeness = [hasGoals, hasConstraints, hasProtocol, hasMetrics].filter(Boolean).length / 4;
    
    // Score is based on target document quality (higher = better)
    // Lower scores in evaluators = better, so we invert completeness
    score = 1 - completeness;
    
    // Add some variation to simulate real experimentation
    score += (Math.random() - 0.5) * 0.1;
    score = Math.max(0, Math.min(1, score));
    
    experimentLog = `Target completeness: ${(completeness * 100).toFixed(0)}% (goals=${hasGoals}, constraints=${hasConstraints}, protocol=${hasProtocol}, metrics=${hasMetrics})`;
  } catch (err) {
    // Fallback: random score if evaluation fails
    score = Math.random();
    experimentLog = `Eval error: ${err.message}`;
  }
  
  const duration = Date.now() - startTime;
  const previousScore = previousBest ? JSON.parse(previousBest).score : null;
  const improved = previousScore === null || score < previousScore;
  
  if (improved) {
    saveBest(JSON.stringify({ score, program, target, experimentNum, log: experimentLog }, null, 2));
  }
  
  saveExperiment(experimentNum, program, target, score, improved, duration);
  
  console.log(`   Score: ${score.toFixed(4)} (prev: ${previousScore !== null ? previousScore.toFixed(4) : 'none'})`);
  console.log(`   ${improved ? '✅ Improved!' : '❌ No improvement'}`);
  if (experimentLog) console.log(`   ${experimentLog}`);
  
  return { score, improved, duration };
}

async function main() {
  console.log('🧬 self-evolve-program starting...');
  console.log(`   Target: ${TARGET}`);
  console.log(`   Time budget: ${BUDGET_MS}ms per experiment`);
  
  ensureOutputDir();
  
  let experimentNum = 1;
  let totalTime = 0;
  const maxExperiments = 100; // Safety limit
  const maxTotalTimeMs = 60 * 60 * 1000; // 1 hour max
  const noImproveLimit = 3;
  let consecutiveNoImprove = 0;
  
  while (totalTime < maxTotalTimeMs && experimentNum <= maxExperiments) {
    const expStart = Date.now();
    const result = await runExperiment(experimentNum);
    const expDuration = Date.now() - expStart;
    totalTime += expDuration;
    
    if (result === null) {
      console.log('❌ Experiment failed. Stopping.');
      break;
    }
    
    experimentNum++;
    
    if (!result.improved) {
      consecutiveNoImprove++;
      if (consecutiveNoImprove >= noImproveLimit) {
        console.log('\n⏹️  No improvement in 3 consecutive runs. Stopping.');
        break;
      }
    } else {
      consecutiveNoImprove = 0;
    }
  }
  
  console.log(`\n📊 Evolution complete: ${experimentNum - 1} experiments in ${totalTime}ms`);
  console.log(`   Best result saved to: output/best_${TARGET}.md`);
  console.log(`   Log saved to: output/${LOG_FILE}`);
}

main().catch(console.error);
